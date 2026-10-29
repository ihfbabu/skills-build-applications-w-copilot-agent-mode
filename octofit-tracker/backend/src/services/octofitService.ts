import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

type InputObject = Record<string, unknown>;

function apiError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

function asInputObject(input: unknown): InputObject {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw apiError('Request body must be an object', 400);
  }
  return input as InputObject;
}

function requiredText(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw apiError(`${field} is required`, 400);
  }
  return value.trim();
}

function requiredId(value: unknown, field: string) {
  if (typeof value !== 'string' || !Types.ObjectId.isValid(value)) {
    throw apiError(`${field} must be a valid ID`, 400);
  }
  return value;
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const body = asInputObject(input);
  const userId = requiredId(body.userId, 'userId');
  const teamId = requiredId(body.teamId, 'teamId');
  const type = requiredText(body.type, 'type');
  const minutes = body.minutes;
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw apiError('minutes must be a positive number', 400);
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) throw apiError('userId and teamId must reference existing records', 404);

  return Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const body = asInputObject(input);
  const name = requiredText(body.name, 'name');
  const mascot = requiredText(body.mascot, 'mascot');
  const memberIds = body.members ?? [];
  if (!Array.isArray(memberIds)) throw apiError('members must be an array', 400);
  const members = memberIds.map((id) => requiredId(id, 'member ID'));

  if (members.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: members } });
    if (existingMembers !== new Set(members).size) throw apiError('members must reference existing users', 404);
  }

  return Team.create({ name, mascot, members });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ teamName: string; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
    {
      $lookup: {
        from: Team.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'team',
      },
    },
    { $unwind: '$team' },
    { $project: { _id: 0, teamName: '$team.name', totalPoints: 1 } },
  ]);

  return totals.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: decodeURIComponent(userEmail) }).lean();
  if (!user) throw apiError('No user found for that email', 404);

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const focus = user.fitnessGoal || recentActivity?.type;
  const workouts = await Workout.find().lean();
  const normalizedFocus = focus?.trim().toLowerCase();
  const matchingWorkouts = normalizedFocus
    ? workouts.filter((workout) => workout.focus.trim().toLowerCase() === normalizedFocus)
    : [];
  const suggestions = matchingWorkouts.length > 0 ? matchingWorkouts : workouts;
  const reason = recentActivity
    ? `Matches your ${focus ?? 'fitness'} goal and recent ${recentActivity.type} activity.`
    : `Matches your ${focus ?? 'fitness'} goal.`;

  return suggestions.map((workout) => ({ ...workout, reason }));
}

export { User };
