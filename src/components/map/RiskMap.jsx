import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const NER_CENTER = [25.8, 93.5];

function RiskMap() {
  return (
    <div className="h-[600px] w-full overflow-hidden rounded-xl border border-slate-700">
      <MapContainer
        center={NER_CENTER}
        zoom={6}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}

export default RiskMap;