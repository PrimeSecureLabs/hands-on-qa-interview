import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYMENT_GATEWAY_URL =
  process.env.PAYMENT_GATEWAY_URL || 'http://localhost:3005';

export interface CustomerRegistrationData {
  customerData: any;
  affiliateLink?: string;
}

export interface AffiliateValidationResponse {
  isValid: boolean;
  userId?: number;
  userName?: string;
}

class PaymentGatewayService {
  private baseURL: string;

  constructor() {
    this.baseURL = PAYMENT_GATEWAY_URL;
    console.log('PaymentGatewayService inicializado com URL:', this.baseURL);
  }

  /**
   * Registra um customer no payment-gateway-svc com link de afiliado opcional
   */
  async registerCustomerWithAffiliate(
    data: CustomerRegistrationData
  ): Promise<any> {
    try {
      console.log('Registrando customer no payment-gateway:', {
        customerId: data.customerData.id,
        affiliateLink: data.affiliateLink,
      });

      const response = await axios.post(
        `${this.baseURL}/api/customers/register`,
        data,
        {
          timeout: 100,
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Secret': process.env.SECRET_KEY,
          },
        }
      );

      console.log('Resposta do registro:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        'Erro ao registrar customer no payment-gateway:',
        error.message
      );

      // Se o payment-gateway não estiver disponível, não quebra o fluxo
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.warn(
          'Payment-gateway-svc não disponível. Customer criado apenas no backend-central.'
        );
        return {
          warning:
            'Payment gateway não disponível. Vínculo de afiliado não processado.',
        };
      }

      throw error;
    }
  }

  /**
   * Valida se um link de afiliado é válido
   */
  async validateAffiliateLink(
    affiliateLink: string
  ): Promise<AffiliateValidationResponse> {
    try {
      console.log(
        `Fazendo requisição para: ${this.baseURL}/api/customers/validate-affiliate/${affiliateLink}`
      );

      const response = await axios.get(
        `${this.baseURL}/api/customers/validate-affiliate/${affiliateLink}`,
        {
          timeout: 3000,
        }
      );

      console.log(
        'Resposta do payment-gateway:',
        response.status,
        response.data
      );

      // Ajusta o formato da resposta do payment-gateway para o formato esperado
      if (response.data.success && response.data.data) {
        const { valid, affiliateUserId, userName } = response.data.data;
        const adjustedResponse = {
          isValid: valid,
          userId: affiliateUserId,
          userName: userName || undefined,
        };
        console.log('Resposta ajustada:', adjustedResponse);
        return adjustedResponse;
      }

      // Se não tem o formato esperado, assume que é inválido
      console.log('Formato de resposta inesperado, considerando inválido');
      return { isValid: false };
    } catch (error: any) {
      console.error('Erro ao validar link de afiliado:', error.message);
      console.error('Detalhes do erro:', {
        code: error.code,
        response: error.response?.status,
        responseData: error.response?.data,
      });

      // Se o serviço não estiver disponível, assume que o link é inválido
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.warn(
          'Payment-gateway-svc não disponível para validação de link.'
        );
        return { isValid: false };
      }

      // Se o link não foi encontrado (404), é inválido
      if (error.response?.status === 404) {
        console.log('Link não encontrado (404), considerando inválido');
        return { isValid: false };
      }

      throw error;
    }
  }
}

export const paymentGatewayService = new PaymentGatewayService();
