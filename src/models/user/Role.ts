import { DataTypes, Model, Sequelize } from 'sequelize';

export class Role extends Model {
  public id!: number;
  public name!: string;
}

export function initRole(sequelize: Sequelize) {
  Role.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'roles',
      timestamps: false,
    }
  );
}
