import { DataTypes, Model, Sequelize } from 'sequelize';
import bcrypt from 'bcrypt';
import { CustomerLevel } from '../customer/CustomerLevels';

export interface CustomerAttributes {
  id?: number;
  name: string;
  email: string;
  password: string;
  document?: string;
  phone?: string;
  birthday?: string;
  level_id?: number;
  points?: number;
  created_at?: Date;
  stripe_customer_id?: string;
  affiliate_user_id?: number;
}

export class Customer extends Model<CustomerAttributes> implements CustomerAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public document?: string;
  public phone?: string;
  public birthday?: string;
  public level_id!: number;
  public points!: number;
  public created_at!: Date;
  public stripe_customer_id?: string;
  public affiliate_user_id?: number;

  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

export const initCustomer = (sequelize: Sequelize) => {
  Customer.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      document: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      birthday: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      level_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      stripe_customer_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      affiliate_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'customers',
      timestamps: false,
      hooks: {
        beforeCreate: async (customer: Customer) => {
          if (customer.password) {
            const salt = await bcrypt.genSalt(10);
            customer.password = await bcrypt.hash(customer.password, salt);
          }
        },
        beforeUpdate: async (customer: Customer) => {
          if (customer.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            customer.password = await bcrypt.hash(customer.password, salt);
          }
        },
        afterUpdate: async (customer: Customer) => {
          if (customer.changed('points')) {
            try {
              const levels = await CustomerLevel.findAll({
                order: [['required_points', 'ASC']],
              });

              if (!levels || levels.length === 0) {
                console.error('No levels found in the customer_levels table.');
                return;
              }

              const matchedLevel = levels.reverse().find(level => customer.points >= level.required_points);

              if (matchedLevel && customer.level_id !== matchedLevel.id) {
                customer.level_id = matchedLevel.id;
                await customer.save(); // Save the updated level_id
              }
            } catch (error) {
              console.error('Error updating customer level:', error);
            }
          }
        },
      },
    }
  );
};
