import { LessThan, MoreThan } from "typeorm";
import { AppDataSource } from "../databaseHelper/dataSource";
import { Notification } from "../model/notification";
export const getNotificationsByUserId = async (userId: number) => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const notifications = await AppDataSource.getRepository(Notification).find({
    relations: {
      user: true,
      photographer: true,
    },
    order: {
      createdAt: "DESC",
    },
    where: {
      user: {
        id: userId,
      },
      createdAt: MoreThan(oneMonthAgo),
    },
  });

  // Delete old notifications
  await AppDataSource.getRepository(Notification).delete({
    user: { id: userId },
    createdAt: LessThan(oneMonthAgo),
  });

  return notifications;
};

export const deleteNotificationById = async (id: number) => {
  const notificationRepo = AppDataSource.getRepository(Notification);
  const notification = await notificationRepo.findOne({
    where: { id },
    relations: {
      user: true,
      photographer: true,
    },
  });
  if (!notification) {
    throw new Error("Notification not found");
  }
  await notificationRepo.remove(notification);
  return notification;
};
