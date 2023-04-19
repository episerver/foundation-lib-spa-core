import Database from './Database';
import Transaction from './Transaction';
export type SchemaUpgrade = (f: Database, t: Transaction) => Promise<boolean>;
export default SchemaUpgrade;
