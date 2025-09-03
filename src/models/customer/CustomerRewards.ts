import { DataTypes, Model, Sequelize } from 'sequelize';

export interface CustomerRewardAttributes {
  id?: number;
  title: string;
  description: string;
  icon_url?: string;
  required_level: number;
  created_at?: Date;
}

export class CustomerReward extends Model<CustomerRewardAttributes> implements CustomerRewardAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public icon_url?: string;
  public required_level!: number;
  public created_at!: Date;
}

export const initCustomerReward = (sequelize: Sequelize) => {
  CustomerReward.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      icon_url: {
        type: DataTypes.STRING,
      },
      required_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'customer_rewards',
      timestamps: false,
    }
  );
};
