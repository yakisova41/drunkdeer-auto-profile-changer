import { KeySetting } from '../store/profile';
import { HidDevice, sendPacketHid } from './hid';

export async function sendProfile(profile: Array<KeySetting>, device: HidDevice) {
  return new Promise(async (resolve, reject) => {
    try {
      const packets: Uint8Array[] = [];

      packets.push(buildPkt_action_point(profile, 0));

      packets.push(buildPkt_action_point(profile, 1));

      packets.push(buildPkt_action_point(profile, 2));

      packets.push(buildPkt_downstroke(profile, 0));

      packets.push(buildPkt_downstroke(profile, 1));

      packets.push(buildPkt_downstroke(profile, 2));

      packets.push(buildPkt_upstroke(profile, 0));

      packets.push(buildPkt_upstroke(profile, 1));

      packets.push(buildPkt_upstroke(profile, 2));
      let sendPackets: number[][] = [];
      packets.forEach((packet) => {
        sendPackets.push(Array.from(packet));
      }),
        await transmit_report_packet(sendPackets, device);
      resolve(true);
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
}

function buildPkt_action_point(keySettings: Array<KeySetting>, pktNum: number) {
  const pktData = new Uint8Array(63);
  pktData[0] = 0xb6;
  pktData[1] = 0x01;
  pktData[2] = 0x00;
  pktData[3] = pktNum; // 0,1,2
  if (pktNum === 0) {
    for (let pos = 0; pos < 59; pos++) {
      let value = keySettings[pos].action_point * 10;
      if (value > 38) {
        value = 38;
      }
      if (value < 2) {
        value = 2;
      }
      pktData[4 + pos] = value;
    }
  } else if (pktNum === 1) {
    for (let pos = 0; pos < 59; pos++) {
      let value = keySettings[pos + 59].action_point * 10;
      if (value > 38) {
        value = 38;
      }
      if (value < 2) {
        value = 2;
      }
      pktData[4 + pos] = value;
    }
  } else {
    for (let pos = 0; pos < 8; pos++) {
      let value = keySettings[pos + 118].action_point * 10;
      if (value > 38) {
        value = 38;
      }
      if (value < 2) {
        value = 2;
      }
      pktData[4 + pos] = value;
    }
  }
  return pktData;
}

function buildPkt_downstroke(keySettings: Array<KeySetting>, pktNum: number) {
  const pktData = new Uint8Array(63);
  pktData[0] = 0xb6;
  pktData[1] = 0x04;
  pktData[2] = 0x00;
  pktData[3] = pktNum; //0,1,2
  if (pktNum === 0) {
    for (let pos = 0; pos < 59; pos++) {
      let value = keySettings[pos].downstroke * 10;
      if (value > 36) {
        value = 36;
      }
      if (value < 0) {
        value = 0;
      }
      pktData[4 + pos] = value;
    }
  } else if (pktNum === 1) {
    for (let pos = 0; pos < 59; pos++) {
      let value = keySettings[pos + 59].downstroke * 10;
      if (value > 36) {
        value = 36;
      }
      if (value < 0) {
        value = 0;
      }
      pktData[4 + pos] = value;
    }
  } else {
    for (let pos = 0; pos < 8; pos++) {
      let value = keySettings[pos + 118].downstroke * 10;
      if (value > 36) {
        value = 36;
      }
      if (value < 0) {
        value = 0;
      }
      pktData[4 + pos] = value;
    }
  }
  return pktData;
}

function buildPkt_upstroke(keySettings: Array<KeySetting>, pktNum: number) {
  const pktData = new Uint8Array(63);
  pktData[0] = 0xb6;
  pktData[1] = 0x05;
  pktData[2] = 0x00;
  pktData[3] = pktNum; //0,1,2
  if (pktNum === 0) {
    for (let pos = 0; pos < 59; pos++) {
      let value = keySettings[pos].upstroke * 10;
      if (value > 36) {
        value = 36;
      }
      if (value < 0) {
        value = 0;
      }
      pktData[4 + pos] = value;
    }
  } else if (pktNum === 1) {
    for (let pos = 0; pos < 59; pos++) {
      let value = keySettings[pos + 59].upstroke * 10;
      if (value > 36) {
        value = 36;
      }
      if (value < 0) {
        value = 0;
      }
      pktData[4 + pos] = value;
    }
  } else {
    for (let pos = 0; pos < 8; pos++) {
      let value = keySettings[pos + 118].upstroke * 10;
      if (value > 36) {
        value = 36;
      }
      if (value < 0) {
        value = 0;
      }
      pktData[4 + pos] = value;
    }
  }
  return pktData;
}

async function transmit_report_packet(packets: number[][], device: HidDevice): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const keyboard_report_id = 0x04;

    sendPacketHid(device.path, packets, keyboard_report_id)
      .then(() => {
        console.log('SEND PACKET', packets);
        resolve(true);
      })
      .catch((e) => {
        reject(e);
      });
  });
}
