import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

const keys = [
    "timestamp",
    "name",
    "pci.bus_id",
    "driver_version",
    "pstate",
    "pcie.link.gen.max",
    "pcie.link.gen.current",
    "temperature.gpu",
    "utilization.gpu",
    "utilization.memory",
    "memory.total",
    "memory.free",
    "memory.used"
] as const

const gpuTempeturyCommand = `nvidia-smi --query-gpu=${keys.join(",")} --format=csv,noheader`; // change it for your OS

type KeysTuple = typeof keys;

type RecordFromTuple<T extends readonly string[]> = {
    [K in T[number]]: string;
};

export async function getNvidiaInfo(): Promise<RecordFromTuple<KeysTuple>> {
    try {
        const result = await execAsync(gpuTempeturyCommand);
        const values = result.stdout.split(",");
        return keys.reduce((obj, key, index) => {
            obj[key] = values[index]
            return obj
        }, {} as any);
    } catch (error) {
        console.log('Error during getting GPU temperature');
        return {} as never;
    }
}