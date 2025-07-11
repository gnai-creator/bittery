import HomeClient from "../../components/HomeClient";
import RoomsView from "../../components/RoomsView";

export const metadata = { title: "Testnet Rooms" };

export default function TestPage() {
  return (
    <main className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Testnet Rooms</h1>
      <p className="text-gray-600">
        Select a room to join the testnet lottery.
      </p>
      <RoomsView network="test" />
      <HomeClient />
    </main>
  );
}
