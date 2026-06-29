import { createSlice } from "@reduxjs/toolkit"
import allProduct, { AllProductProp } from "../../Data/allProducts"

interface initialValueProp {
    value: AllProductProp[];
}

const initalValue: initialValueProp = {
    value: []
}

const plansSlice = createSlice({
    name: "hotelItems",
    initialState: initalValue,
    reducers: {
        featuredRooms: (state) => {
            state.value = allProduct.filter(x => x.category === "featuredRoom");
        },
        allRooms: (state) => {
            state.value = allProduct.filter(x => x.itemType === "room");
        },
        allMenu: (state) => {
            state.value = allProduct.filter(x => x.itemType === "menu");
        },
        allServices: (state) => {
            state.value = allProduct.filter(x => x.itemType === "service");
        },
        menuByCategory: (state, action: { payload: string }) => {
            state.value = allProduct.filter(x => x.category === action.payload);
        },
        allItems: (state) => {
            state.value = allProduct;
        },
        // legacy aliases
        newPlans: (state) => {
            state.value = allProduct.filter(x => x.category === "featuredRoom");
        },
        allPlans: (state) => {
            state.value = allProduct.filter(x => x.itemType === "room");
        }
    }
})

export const { featuredRooms, allRooms, allMenu, allServices, menuByCategory, allItems, newPlans, allPlans } = plansSlice.actions;

export default plansSlice.reducer;
