import { DataTypes, Model, Sequelize } from 'sequelize';

export interface UserSessionAttributes {
  id?: number;
  user_id: number;
  ip_address: string;
  user_agent: string;
  started_at: Date;
  ended_at?: Date | null;
  is_active: boolean;
  token: string;
}

export class UserSession extends Model<UserSessionAttributes> implements UserSessionAttributes {
  public id!: number;
  public user_id!: number;
  public ip_address!: string;
  public user_agent!: string;
  public started_at!: Date;
  public ended_at!: Date | null;
  public is_active!: boolean;
  public token!: string;
}

export const initUserSession = (sequelize: Sequelize) => {
  UserSession.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_agent: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      ended_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'user_sessions',
      timestamps: false,
    }
  );
};
