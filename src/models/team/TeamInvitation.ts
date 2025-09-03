import { DataTypes, Model, Sequelize } from 'sequelize';

export class TeamInvitation extends Model {
  public id!: number;
  public team_id!: number;
  public email!: string;
  public role_id!: number;
  public invited_by_user_id!: number;
  public token!: string;
  public status!: string;
  public created_at!: Date;
  public accepted_at?: Date;
}

export function initTeamInvitation(sequelize: Sequelize) {
  TeamInvitation.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    team_id: { type: DataTypes.INTEGER, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    invited_by_user_id: { type: DataTypes.INTEGER, allowNull: false },
    token: { type: DataTypes.STRING, allowNull: false, unique: true },
    status: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false },
    accepted_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    tableName: 'team_invitations',
    timestamps: false
  });
}
