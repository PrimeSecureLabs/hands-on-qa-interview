import { DataTypes, Model, Sequelize } from 'sequelize';

export interface UserAuthenticationAttributes {
  id?: number;
  user_id: number;
  token: string;
  status: string;
  created_at?: Date;
  accepted_at?: Date;
}

export class UserAuthentication extends Model<UserAuthenticationAttributes> implements UserAuthenticationAttributes {
  public id!: number;
  public user_id!: number;
  public token!: string;
  public status!: string;
  public created_at!: Date;
  public accepted_at!: Date;
}

export const initUserAuthentication = (sequelize: Sequelize) => {
  UserAuthentication.init(
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
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      accepted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'users_authentication',
      timestamps: false,
    }
  );
};
