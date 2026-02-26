import { createContext, useContext, useState, ReactNode } from 'react';

export type RSVPStatus = 'going' | 'maybe' | 'not-going' | 'pending';

export interface Hangout {
  id: string;
  title: string;
  time: string;
  date: string;
  location?: string;
  description?: string;
  host: string;
  going: number;
  maybe: number;
  notGoing: number;
  userStatus: RSVPStatus;
  timeUntil: string;
  inviteType?: string;
  groupName?: string;
}

interface HangoutsContextType {
  hangouts: Hangout[];
  updateHangoutRSVP: (hangoutId: string, status: RSVPStatus) => void;
  getHangout: (hangoutId: string) => Hangout | undefined;
}

const HangoutsContext = createContext<HangoutsContextType | undefined>(undefined);

export function HangoutsProvider({ children }: { children: ReactNode }) {
  const [hangouts, setHangouts] = useState<Hangout[]>([
    {
      id: '1',
      title: 'Coffee at Blue Bottle',
      time: '2:00 PM',
      date: 'Today',
      location: 'Blue Bottle Coffee, Hayes Valley',
      description: 'Quick coffee catch-up before the weekend!',
      host: 'Sarah Chen',
      going: 4,
      maybe: 2,
      notGoing: 1,
      userStatus: 'going',
      timeUntil: 'in 2h',
      inviteType: 'group',
      groupName: 'Work Friends'
    },
    {
      id: '2',
      title: 'Pickup Basketball',
      time: '6:00 PM',
      date: 'Today',
      location: 'Mission Rec Center',
      description: 'Weekly pickup game. Bring your A-game!',
      host: 'Marcus Johnson',
      going: 8,
      maybe: 3,
      notGoing: 2,
      userStatus: 'maybe',
      timeUntil: 'in 6h',
      inviteType: 'group',
      groupName: 'Basketball Crew'
    },
    {
      id: '3',
      title: 'Dinner at Nopa',
      time: '7:30 PM',
      date: 'Tomorrow',
      location: 'Nopa Restaurant',
      description: 'Trying out that new restaurant everyone is talking about',
      host: 'You',
      going: 5,
      maybe: 1,
      notGoing: 0,
      userStatus: 'going',
      timeUntil: 'Tomorrow',
      inviteType: 'private'
    },
    {
      id: '4',
      title: 'Weekend Hike',
      time: '8:00 AM',
      date: 'Saturday',
      location: 'Lands End Trail',
      description: 'Morning hike with amazing views. Bring water and snacks!',
      host: 'Alex Rivera',
      going: 6,
      maybe: 2,
      notGoing: 1,
      userStatus: 'pending',
      timeUntil: 'Saturday',
      inviteType: 'public'
    },
    {
      id: '5',
      title: 'Game Night',
      time: '8:00 PM',
      date: 'Saturday',
      location: "Jamie's Place",
      description: 'Board games and chill vibes',
      host: 'Jamie Lee',
      going: 7,
      maybe: 1,
      notGoing: 0,
      userStatus: 'going',
      timeUntil: 'Saturday',
      inviteType: 'group',
      groupName: 'Roommates'
    }
  ]);

  const updateHangoutRSVP = (hangoutId: string, status: RSVPStatus) => {
    setHangouts(prevHangouts => 
      prevHangouts.map(hangout => {
        if (hangout.id === hangoutId) {
          // Calculate new counts based on old and new status
          let newGoing = hangout.going;
          let newMaybe = hangout.maybe;
          let newNotGoing = hangout.notGoing;

          // Remove from old status count
          if (hangout.userStatus === 'going') newGoing--;
          else if (hangout.userStatus === 'maybe') newMaybe--;
          else if (hangout.userStatus === 'not-going') newNotGoing--;

          // Add to new status count
          if (status === 'going') newGoing++;
          else if (status === 'maybe') newMaybe++;
          else if (status === 'not-going') newNotGoing++;

          return {
            ...hangout,
            userStatus: status,
            going: newGoing,
            maybe: newMaybe,
            notGoing: newNotGoing
          };
        }
        return hangout;
      })
    );
  };

  const getHangout = (hangoutId: string) => {
    return hangouts.find(h => h.id === hangoutId);
  };

  return (
    <HangoutsContext.Provider value={{ hangouts, updateHangoutRSVP, getHangout }}>
      {children}
    </HangoutsContext.Provider>
  );
}

export function useHangouts() {
  const context = useContext(HangoutsContext);
  if (context === undefined) {
    throw new Error('useHangouts must be used within a HangoutsProvider');
  }
  return context;
}
