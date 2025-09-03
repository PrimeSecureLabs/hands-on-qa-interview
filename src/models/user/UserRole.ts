import { DataTypes, Model, Sequelize } from 'sequelize';

export class UserRole extends Model {
  public user_id!: number;
  public role_id!: number;
}

export function initUserRole(sequelize: Sequelize) {
  UserRole.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: 'UserRole',
      tableName: 'user_roles',
      timestamps: false,
    }
  );
}
