import { describe, it, expect, beforeEach, vi } from 'vitest';
import { paymentGatewayService } from '../services/paymentGatewayService';
import axios from 'axios';

// Mock do axios de forma simples
vi.mock('axios');

describe('Payment Gateway Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerCustomerWithAffiliate', () => {
    it('should register customer successfully', async () => {
      // Testar registro bem-sucedido - com estrutura CORRETA
      const registrationData = {
        customerData: {
          id: 1,
          name: 'João Silva',
          email: 'joao.silva@email.com',
          document: '12345678901',
          phone: '11999999999',
          localization: 'SP'
        },
        affiliateLink: 'https://site.com/affiliate/AFF123'
      };
      
      const mockResponse = {
        data: { 
          success: true, 
          customerId: 'cust_12345'
        }
      };
      
      (axios.post as any).mockResolvedValue(mockResponse);
      
      const result = await paymentGatewayService.registerCustomerWithAffiliate(registrationData);
      
      expect(result.success).toBe(true);
      expect(result.customerId).toBe('cust_12345');
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('should handle timeout errors', async () => {
      // Testar configurações de timeout
      const registrationData = {
        customerData: {
          id: 2,
          name: 'Maria Santos',
          email: 'maria.santos@email.com',
          document: '98765432100',
          phone: '11888888888',
          localization: 'RJ'
        },
        affiliateLink: 'https://site.com/affiliate/AFF456'
      };
      
      // CORREÇÃO: Simular erro com a estrutura que o service espera
      const timeoutError = new Error('timeout of 5000ms exceeded');
      (timeoutError as any).code = 'ETIMEDOUT'; // ← Isso é crucial!
      
      (axios.post as any).mockRejectedValue(timeoutError);
      
      const result = await paymentGatewayService.registerCustomerWithAffiliate(registrationData);
      
      // O service deve retornar warning para erros de timeout
      expect(result.warning).toContain('Payment gateway não disponível');
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('should not expose sensitive data in headers', async () => {
      // Verificar configuração de headers
      const registrationData = {
        customerData: {
          id: 3,
          name: 'Pedro Oliveira',
          email: 'pedro.oliveira@email.com',
          document: '45678912300',
          phone: '11777777777',
          localization: 'SP'
        },
        affiliateLink: 'https://site.com/affiliate/AFF789'
      };
      
      (axios.post as any).mockResolvedValue({ data: { success: true } });
      
      await paymentGatewayService.registerCustomerWithAffiliate(registrationData);
      
      const callConfig = (axios.post as any).mock.calls[0][2];
      expect(callConfig?.headers).toBeDefined();
      
      // Verificar que headers sensíveis não estão expostos
      const headers = callConfig?.headers || {};
      expect(headers['X-Internal-Secret']).toBeUndefined();
      expect(headers['X-Internal-Api-Key']).toBeDefined();
    });

    it('should use proper timeout configuration', async () => {
      // Testar configuração de timeout
      const registrationData = {
        customerData: {
          id: 4,
          name: 'Ana Costa',
          email: 'ana.costa@email.com',
          document: '32165498700',
          phone: '11666666666',
          localization: 'MG'
        },
        affiliateLink: 'https://site.com/affiliate/AFF101'
      };
      
      (axios.post as any).mockResolvedValue({ data: { success: true } });
      
      await paymentGatewayService.registerCustomerWithAffiliate(registrationData);
      
      const callConfig = (axios.post as any).mock.calls[0][2];
      expect(callConfig?.timeout).toBe(5000); // Timeout de 5 segundos
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Testar tratamento de erros de rede
      const registrationData = {
        customerData: {
          id: 5,
          name: 'Carlos Rodrigues',
          email: 'carlos.rodrigues@email.com',
          document: '15975348620',
          phone: '11555555555',
          localization: 'RS'
        },
        affiliateLink: 'https://site.com/affiliate/AFF202'
      };
      
      (axios.post as any).mockRejectedValue({ code: 'ECONNREFUSED' });
      
      const result = await paymentGatewayService.registerCustomerWithAffiliate(registrationData);
      
      expect(result.warning).toContain('Payment gateway não disponível');
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('should handle malformed responses', async () => {
      // Testar respostas malformadas do gateway
      const registrationData = {
        customerData: {
          id: 6,
          name: 'Fernanda Lima',
          email: 'fernanda.lima@email.com',
          document: '35715948620',
          phone: '11444444444',
          localization: 'PR'
        },
        affiliateLink: 'https://site.com/affiliate/AFF303'
      };
      
      (axios.post as any).mockResolvedValue({ data: { invalid: 'response' } });
      
      const result = await paymentGatewayService.registerCustomerWithAffiliate(registrationData);
      
      // Deve retornar a resposta mesmo que malformada
      expect(result.invalid).toBe('response');
      expect(axios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateAffiliateLink', () => {
    it('should validate affiliate link successfully', async () => {
      const affiliateLink = 'AFF123';
      const mockResponse = {
        data: {
          success: true,
          data: {
            valid: true,
            affiliateUserId: 123,
            userName: 'João Silva'
          }
        }
      };
      
      (axios.get as any).mockResolvedValue(mockResponse);
      
      const result = await paymentGatewayService.validateAffiliateLink(affiliateLink);
      
      expect(result.isValid).toBe(true);
      expect(result.userId).toBe(123);
      expect(result.userName).toBe('João Silva');
    });
  });
});