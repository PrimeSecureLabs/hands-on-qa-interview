import { DataTypes, Model, Sequelize } from 'sequelize';
import bcrypt from 'bcrypt';
import { UserLevel } from './UserLevel';

export interface UserAttributes {
  id?: number;
  name: string;
  email: string;
  password: string;
  document: string;
  phone?: string;
  localization?: string;
  enterprise?: string;
  company_position?: string;
  website?: string;
  birthday?: string;
  bio?: string;
  level?: number;
  points?: number;
  created_at?: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public document!: string;
  public phone?: string;
  public localization?: string;
  public enterprise?: string;
  public company_position?: string;
  public website?: string;
  public birthday?: string;
  public bio?: string;
  public level!: number;
  public points!: number;
  public created_at!: Date;

  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

export const initUser = (sequelize: Sequelize) => {
  User.init(
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      document: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      localization: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      enterprise: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      company_position: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      birthday: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bio: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: false,
      hooks: {
        beforeCreate: async (user: User) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user: User) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        afterUpdate: async (user: User) => {
          if (user.changed('points')) {
            try {
              const levels = await UserLevel.findAll({
                order: [['required_points', 'ASC']],
              });

              if (!levels || levels.length === 0) {
                console.error('No levels found in the user_levels table.');
                return;
              }

              const matchedLevel = levels.reverse().find(level => user.points >= level.required_points);

              if (matchedLevel && user.level !== matchedLevel.id) {
                user.level = matchedLevel.id;
                await user.save();
              }
            } catch (error) {
              console.error('Error updating user level:', error);
            }
          }
        },
      },
    }
  );
};
