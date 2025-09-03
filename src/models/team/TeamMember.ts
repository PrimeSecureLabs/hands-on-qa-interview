import { DataTypes, Model, Sequelize } from 'sequelize';

export class TeamMember extends Model {
  public team_id!: number;
  public member_id!: number;
  public role_id!: number;
  public joined_at!: Date;
}

export function initTeamMember(sequelize: Sequelize) {
  TeamMember.init({
    team_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    member_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    joined_at: { type: DataTypes.DATE, allowNull: false }
  }, {
    sequelize,
    tableName: 'team_members',
    timestamps: false
  });
}
