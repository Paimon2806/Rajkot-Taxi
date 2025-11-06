# Focused Task List - Ride Acceptance Logic

This file breaks down the tasks required to refine the ride acceptance logic and UI.

---

### Task 1: Prevent Self-Acceptance of Rides

**Goal:** Prevent the "Accept Ride" button from appearing on a ride card if the current user is the one who posted it.

**File to Modify:** `components/RideCard.tsx`
- [ ] **Step 1.1:** Add a new required prop `uid` to the `RideCardProps` interface to receive the ID of the user who posted the ride.
- [ ] **Step 1.2:** In the `renderStatusAction` function, modify the condition for showing the "Accept Ride" button. Change it from `if (!assignedTo)` to `if (!assignedTo && uid !== user?.uid)`. This ensures the button only appears if the ride is unassigned AND the current user is NOT the poster.

**Files to Modify (to pass the new `uid` prop):**
- [ ] **Step 1.3:** In `app/(tabs)/ridelist.tsx`, update the `Ride` interface to include `uid: string;`. In the `onSnapshot` logic, ensure `uid: doc.data().uid` is mapped. Finally, in `renderItem`, pass the `uid={item.uid}` prop to the `<RideCard />` component.
- [ ] **Step 1.4:** In `app/(tabs)/my-accepted-rides.tsx`, update the `Ride` interface to include `uid: string;`. In the `onSnapshot` logic, ensure `uid: doc.data().uid` is mapped. Finally, in `renderItem`, pass the `uid={item.uid}` prop to the `<RideCard />` component.
- [ ] **Step 1.5:** In `app/my-posted-rides.tsx`, update the `Ride` interface to include `uid: string;`. In the `fetchMyPostedRides` logic, ensure `uid: doc.data().uid` is mapped. Finally, in `renderRideItem`, pass the `uid={item.uid}` prop to the `<RideCard />` component.

---

### Task 2: Add Refresh Button to Ride List Header

**Goal:** Add a dedicated refresh icon button to the header of the "Available Rides" screen for manual data refreshing.

**File to Modify:** `app/(tabs)/ridelist.tsx`
- [ ] **Step 2.1:** In the `return` statement, inside the `<Appbar.Header>` component, add an `<Appbar.Action icon="refresh" onPress={onRefresh} />` after the `<Appbar.Content />`. The `onRefresh` function already exists.

---

### Task 3: Verify "Accept Ride" Action is Restricted

**Goal:** Confirm that the "Accept Ride" button and logic are only active on the `ridelist.tsx` screen.

- [ ] **Step 3.1:** Review `app/my-posted-rides.tsx`. Confirm that the `<RideCard />` component is called *without* an `onAccept` prop. The logic from Task 1 should now correctly hide the button anyway, but this ensures no action would be called even if it were visible.
- [ ] **Step 3.2:** Review `app/(tabs)/my-accepted-rides.tsx`. Confirm that the `onAccept` prop is passed as a dummy function (`() => {}`). The `RideCard`'s internal logic correctly shows the "Mark as Completed" button instead, so this is correct.