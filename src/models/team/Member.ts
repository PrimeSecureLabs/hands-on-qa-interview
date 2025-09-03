import { DataTypes, Model, Sequelize } from 'sequelize';

export class Member extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
  public name!: string;
  public active!: boolean;
  public created_at!: Date;
}

export function initMember(sequelize: Sequelize) {
  Member.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false }
  }, {
    sequelize,
    tableName: 'members',
    timestamps: false
  });
}
