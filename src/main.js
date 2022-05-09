import './main.css';
import 'flowbite';
import {
  parseTimeZoneUtcOffset,
  formatOpenNowString,
  formatTime
} from "/src/locator/time";

function importAll(r) {
    let images = {};
    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
  }
  
  const images = importAll(require.context('./images', false, /\.(png|jpe?g|svg|webp)$/));

  