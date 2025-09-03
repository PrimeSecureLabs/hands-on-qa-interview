import { DataTypes, Model, Sequelize } from 'sequelize';

export class Team extends Model {
  public id!: number;
  public owner_user_id!: number;
  public name!: string;
  public description!: string;
  public created_at!: Date;
}

export function initTeam(sequelize: Sequelize) {
  Team.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    owner_user_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, allowNull: false }
  }, {
    sequelize,
    tableName: 'teams',
    timestamps: false
  });
}
