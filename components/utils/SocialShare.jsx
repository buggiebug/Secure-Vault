import { Share, Alert } from "react-native";

// Share method that takes an event (cardDetails) as input
const SocialShare = async (event) => {
  try {
    // Format the card details into a shareable message
    const shareMessage = `Check out this event: ${event.event_name}\n${event.ticket_link}`;

    const result = await Share.share({
      title: event?.event_name,
      message: shareMessage,
    });

    // Check the result of the share action
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        console.log(`Shared via ${result.activityType}`);
      } else {
        console.log("Shared successfully");
      }
    } else if (result.action === Share.dismissedAction) {
      console.log("Share dismissed");
    }
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};

export default SocialShare;
