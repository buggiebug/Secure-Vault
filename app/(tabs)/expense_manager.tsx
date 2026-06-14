import ExpenseManager from "@/components/expenseManager/ExpenseManager";
import { selectUserDetails } from "@/redux/reselect/reselectData";
import { getAllExpenses } from "@/redux/slice/expenseSlice";

import type { AppDispatch } from "@/redux/store";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";

export default function ExpenseManagerScreen() {
    const dispatch = useDispatch<AppDispatch>();
    // Get auth state from Redux
    const { isLoggedInUser, userData } = useSelector(selectUserDetails);

    const refreshData = useCallback(() => {
        if (isLoggedInUser && userData) {
            dispatch(getAllExpenses());
        }
    }, [dispatch, isLoggedInUser, userData]);

    // Run only when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refreshData();
        }, [refreshData])
    );

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshData();
        setRefreshing(false);
    }, [refreshData]);

    return <ExpenseManager refreshing={refreshing} onRefresh={onRefresh} />;
}
