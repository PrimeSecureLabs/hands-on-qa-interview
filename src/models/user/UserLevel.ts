import { DataTypes, Model, Sequelize } from 'sequelize';

export interface UserLevelAttributes {
  id?: number;
  name: string;
  level_number: number;
  required_points: number;
  icon_url?: string;
  created_at?: Date;
}

export class UserLevel extends Model<UserLevelAttributes> implements UserLevelAttributes {
  public id!: number;
  public name!: string;
  public level_number!: number;
  public required_points!: number;
  public icon_url?: string;
  public created_at!: Date;
}

export const initUserLevel = (sequelize: Sequelize) => {
  UserLevel.init(
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
      level_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      required_points: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      icon_url: {
        type: DataTypes.STRING,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'user_levels',
      timestamps: false,
    }
  );
};
