import { supabase } from "../supabase";

export const addNotification = async (userId, message) => {
  const { error } = await supabase
    .from("notifications")
    .insert([{ user_id: userId, message }]);

  if (error) {
    console.error("Erreur lors de l'ajout de la notification :", error);
  }
};
