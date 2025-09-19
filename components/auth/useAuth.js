import { selectUserDetails } from "@/redux/reselect/reselectData";
import { useSelector } from "react-redux";

const useFetchData = () => {
  // Only select data from Redux - don't dispatch here
  const { loadingStatus, loadingModal, isLoggedInUser, userData } =
    useSelector(selectUserDetails);

  return {
    loadingStatus,
    loadingModal,
    isLoggedInUser,
    userData,
  };
};

export default useFetchData;