import { Match, Prediction, User, UserPoint } from "../types";

const getResult = (home: number, away: number): "home" | "away" | "draw" => {
  if (home > away) return "home";
  if (home < away) return "away";
  return "draw";
};

export function calculateWeekPoints(
  matches: Match[],
  predictions: Prediction[],
  users: User[]
): Record<string, UserPoint> {
  const result: Record<string, UserPoint> = {};

  // Initialize for all users
  users.forEach((user) => {
    result[user.id] = {
      userId: user.id,
      points: 0,
      bonus: 0,
      bonusPoints: 0,
      totalWeekPoints: 0,
      exacts: 0,
      results: 0,
      breakdown: []
    };
  });

  // Calculate points for each match
  matches.forEach((match) => {
    const isPlayed =
      match.actualHome !== null &&
      match.actualHome !== undefined &&
      match.actualAway !== null &&
      match.actualAway !== undefined;

    if (!isPlayed) return;

    const actualHome = match.actualHome as number;
    const actualAway = match.actualAway as number;
    const actualResult = getResult(actualHome, actualAway);

    const matchPredictions = predictions.filter((p) => p.matchId === match.id);

    // Count how many users predicted the correct outcome (result)
    const correctResultCount = matchPredictions.filter((p) => {
      const predictedResult = getResult(p.predictedHome, p.predictedAway);
      return predictedResult === actualResult;
    }).length;

    // Sole predictor bonus applies if only 1 user got the correct outcome
    const hasSolePredictorBonus = correctResultCount === 1;

    matchPredictions.forEach((p) => {
      const userPoint = result[p.userId];
      if (!userPoint) return;

      const isExact =
        p.predictedHome === actualHome && p.predictedAway === actualAway;
      const predictedResult = getResult(p.predictedHome, p.predictedAway);
      const isResultCorrect = predictedResult === actualResult;

      let earned = 0;
      let bonus = 0;

      if (isExact) {
        earned = 2;
        userPoint.exacts = (userPoint.exacts || 0) + 1;
        if (hasSolePredictorBonus) {
          bonus = 1;
        }
      } else if (isResultCorrect) {
        earned = 1;
        userPoint.results = (userPoint.results || 0) + 1;
        if (hasSolePredictorBonus) {
          bonus = 1;
        }
      }

      userPoint.points = (userPoint.points || 0) + earned;
      userPoint.bonus = (userPoint.bonus || 0) + bonus;
      userPoint.bonusPoints = (userPoint.bonusPoints || 0) + bonus;
      userPoint.totalWeekPoints = (userPoint.points || 0) + (userPoint.bonus || 0);

      userPoint.breakdown?.push({
        matchId: match.id,
        earned,
        bonus,
        isExact,
        isResult: isResultCorrect && !isExact,
        predHome: p.predictedHome,
        predAway: p.predictedAway
      });
    });
  });

  // Recalculate totals to ensure consistency
  Object.keys(result).forEach((userId) => {
    const userResult = result[userId];
    userResult.totalWeekPoints = (userResult.points || 0) + (userResult.bonus || 0);
  });

  return result;
}
