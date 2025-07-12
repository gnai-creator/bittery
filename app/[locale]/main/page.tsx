import RoomsView from "../../components/RoomsView";
import HomeClient from "../../components/HomeClient";
export const metadata = { title: "Mainnet Rooms" };

export default function MainPage() {
  return (
    <main className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Mainnet Rooms</h1>
      <p className="text-gray-600">
        Select a room to join the mainnet awards.
      </p>
      <RoomsView network="main" />
      <HomeClient />
    </main>
  );
}
