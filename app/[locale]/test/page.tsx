import RoomsView from '../../components/RoomsView';

export const metadata = { title: 'Testnet Rooms' };

export default function TestPage() {
  return <RoomsView network="test" />;
}
