import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface intialValueProp{
    value : number[];
}

const intialValue:intialValueProp ={
    value : []
}

const SubscriptionSlice = createSlice({
    name : "subscriptions",
    initialState : intialValue,
    reducers : {
        setSubscription : (state,action:PayloadAction<number[]>)=>{
            state.value = action.payload;
        },
        addSubscription : (state,action:PayloadAction<number>)=>{
            state.value = [...state.value,action.payload];
        },
        removeSubscription : (state,action:PayloadAction<number>)=>{
            state.value = state.value.filter(val => val != action.payload);
        }

    }
})

export const {setSubscription, removeSubscription, addSubscription} = SubscriptionSlice.actions;

export default SubscriptionSlice.reducer;