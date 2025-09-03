import { DataTypes, Model, Sequelize } from 'sequelize';

export interface CustomerRewardClaimAttributes {
  id?: number;
  customer_id: number;
  reward_id: number;
  claimed_at?: Date;
}

export class CustomerRewardClaim extends Model<CustomerRewardClaimAttributes> implements CustomerRewardClaimAttributes {
  public id!: number;
  public customer_id!: number;
  public reward_id!: number;
  public claimed_at!: Date;
}

export const initCustomerRewardClaim = (sequelize: Sequelize) => {
  CustomerRewardClaim.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reward_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      claimed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'customer_reward_claims',
      timestamps: false,
    }
  );
};
