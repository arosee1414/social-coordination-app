import { MemoryRouter, Routes, Route } from 'react-router';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthScreen } from './components/AuthScreen';
import { FindFriendsScreen } from './components/FindFriendsScreen';
import { HomeScreen } from './components/HomeScreen';
import { HangoutsListScreen } from './components/HangoutsListScreen';
import { CreateHangoutScreen } from './components/CreateHangoutScreen';
import { InviteSelectionScreen } from './components/InviteSelectionScreen';
import { HangoutDetailScreen } from './components/HangoutDetailScreen';
import { EditHangoutScreen } from './components/EditHangoutScreen';
import { ManageInvitesScreen } from './components/ManageInvitesScreen';
import { GroupsListScreen } from './components/GroupsListScreen';
import { CreateGroupScreen } from './components/CreateGroupScreen';
import { AddMembersScreen } from './components/AddMembersScreen';
import { GroupCreatedScreen } from './components/GroupCreatedScreen';
import { GroupDetailScreen } from './components/GroupDetailScreen';
import { NotificationsScreen } from './components/NotificationsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { FriendProfileScreen } from './components/FriendProfileScreen';
import { BottomNav } from './components/BottomNav';
import { HangoutsProvider } from './contexts/HangoutsContext';

export default function App() {
  return (
    <HangoutsProvider>
      <MemoryRouter initialEntries={['/']} initialIndex={0}>
        <div className="bg-[#F8F9FA] min-h-screen font-sans">
          {/* Mobile container with max width */}
          <div className="max-w-[430px] mx-auto bg-white min-h-screen relative">
            <Routes>
              {/* Onboarding flow */}
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/auth" element={<AuthScreen />} />
              <Route path="/find-friends" element={<FindFriendsScreen />} />
              
              {/* Main app with bottom nav */}
              <Route path="/home" element={<><HomeScreen /><BottomNav /></>} />
              <Route path="/hangouts" element={<><HangoutsListScreen /><BottomNav /></>} />
              <Route path="/groups" element={<><GroupsListScreen /><BottomNav /></>} />
              <Route path="/notifications" element={<><NotificationsScreen /><BottomNav /></>} />
              <Route path="/profile" element={<><ProfileScreen /><BottomNav /></>} />
              
              {/* Hangout flows */}
              <Route path="/create-hangout" element={<CreateHangoutScreen />} />
              <Route path="/create-hangout/invite" element={<InviteSelectionScreen />} />
              <Route path="/hangout/:id" element={<HangoutDetailScreen />} />
              <Route path="/hangout/:id/edit" element={<EditHangoutScreen />} />
              <Route path="/hangout/:id/manage-invites" element={<ManageInvitesScreen />} />
              
              {/* Group flows */}
              <Route path="/create-group" element={<CreateGroupScreen />} />
              <Route path="/create-group/add-members" element={<AddMembersScreen />} />
              <Route path="/group-created" element={<GroupCreatedScreen />} />
              <Route path="/group/:id" element={<GroupDetailScreen />} />
              
              {/* Friend profile */}
              <Route path="/friend/:id" element={<FriendProfileScreen />} />
            </Routes>
          </div>
        </div>
      </MemoryRouter>
    </HangoutsProvider>
  );
}