import { DataTypes, Model, Sequelize } from 'sequelize';

export interface CustomerLevelAttributes {
  id?: number;
  level_number: number;
  required_points: number;
  icon_url?: string;
  created_at?: Date;
}

export class CustomerLevel extends Model<CustomerLevelAttributes> implements CustomerLevelAttributes {
  public id!: number;
  public level_number!: number;
  public required_points!: number;
  public icon_url?: string;
  public created_at!: Date;
}

export const initCustomerLevel = (sequelize: Sequelize) => {
  CustomerLevel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
      tableName: 'customer_levels',
      timestamps: false,
    }
  );
};
