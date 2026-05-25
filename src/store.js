const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const defaults = {
  users: [],
  plans: [
    {
      id: 'minecraft-starter',
      name: 'Minecraft Starter',
      type: 'game-server',
      description: 'Good for a small SMP or friends server.',
      ramGb: 4,
      cpuCores: 2,
      storageGb: 20,
      backupSlots: 2,
      subdomainSlots: 1,
      extraPorts: 1,
      priceMonthly: 8,
      active: true
    },
    {
      id: 'minecraft-pro',
      name: 'Minecraft Pro',
      type: 'game-server',
      description: 'Better for plugins, modpacks, and more players.',
      ramGb: 8,
      cpuCores: 4,
      storageGb: 50,
      backupSlots: 5,
      subdomainSlots: 2,
      extraPorts: 3,
      priceMonthly: 18,
      active: true
    },
    {
      id: 'discord-bot-hosting',
      name: 'Discord Bot Hosting',
      type: 'bot-hosting',
      description: 'Node.js Discord bot hosting with console access.',
      ramGb: 1,
      cpuCores: 1,
      storageGb: 5,
      backupSlots: 1,
      subdomainSlots: 0,
      extraPorts: 1,
      priceMonthly: 4,
      active: true
    }
    ,{
      id: 'vps-starter',
      name: 'VPS Starter',
      type: 'vps',
      description: 'Entry VPS for small websites, bots, and light services.',
      ramGb: 2,
      cpuCores: 1,
      storageGb: 30,
      backupSlots: 1,
      subdomainSlots: 0,
      extraPorts: 3,
      priceMonthly: 10,
      active: true
    },
    {
      id: 'vps-pro',
      name: 'VPS Pro',
      type: 'vps',
      description: 'More power for panels, websites, bots, and game tools.',
      ramGb: 8,
      cpuCores: 4,
      storageGb: 100,
      backupSlots: 3,
      subdomainSlots: 0,
      extraPorts: 10,
      priceMonthly: 35,
      active: true
    }
  ],
  upgrades: [
    { id: 'ram-2gb', name: '+2GB RAM', kind: 'ramGb', amount: 2, priceMonthly: 4, active: true },
    { id: 'storage-20gb', name: '+20GB Storage', kind: 'storageGb', amount: 20, priceMonthly: 3, active: true },
    { id: 'backup-3-slots', name: '+3 Backup Slots', kind: 'backupSlots', amount: 3, priceMonthly: 2, active: true },
    { id: 'subdomain-2-slots', name: '+2 Subdomain Slots', kind: 'subdomainSlots', amount: 2, priceMonthly: 2, active: true },
    { id: 'ports-2', name: '+2 Extra Ports', kind: 'extraPorts', amount: 2, priceMonthly: 2, active: true }
  ],
  orders: [],
  tickets: [],
  reviews: []
};

function filePath(name) {
  return path.join(dataDir, `${name}.json`);
}

function ensureDataFiles() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  for (const [name, value] of Object.entries(defaults)) {
    const fp = filePath(name);
    if (!fs.existsSync(fp)) {
      fs.writeFileSync(fp, JSON.stringify(value, null, 2));
    }
  }
}

function getStore(name) {
  ensureDataFiles();
  return JSON.parse(fs.readFileSync(filePath(name), 'utf8'));
}

function saveStore(name, data) {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}

module.exports = { ensureDataFiles, getStore, saveStore };
