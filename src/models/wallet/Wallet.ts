import { DataTypes, Model, Sequelize } from 'sequelize';

export class Wallet extends Model {
  public id!: number;
  public user_id!: number;
  public balance!: number;
  public updated_at!: Date;
}

export function initWallet(sequelize: Sequelize) {
  Wallet.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { sequelize, tableName: 'wallet', timestamps: false }
  );
}
