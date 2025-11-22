import UserQuest from "../model/UserQuest.js";
import Quest from "../model/Quest.js";

export async function updateQuestProgress(userId, questType, increment = 1) {
  try {
    const quests = await Quest.find({ type: questType, isActive: true });

    for (const quest of quests) {
      let userQuest = await UserQuest.findOne({
        userId,
        questId: quest._id,
      });

      if (!userQuest) {
        userQuest = await UserQuest.create({
          userId,
          questId: quest._id,
          progress: 0,
        });
      }

      if (!userQuest.isCompleted) {
        userQuest.progress += increment;

        if (userQuest.progress >= quest.targetCount) {
          userQuest.isCompleted = true;
          userQuest.completedAt = new Date();
        }

        await userQuest.save();
      }
    }
  } catch (error) {
    console.error("Error updating quest progress:", error);
  }
}
