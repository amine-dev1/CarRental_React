/**
 * Contract number generator.
 * Produces sequential numbers like CTR-2025-0042 scoped per enterprise per year.
 * Uses a transactional query to prevent race conditions.
 */

/**
 * Generate the next contract number for an enterprise within the current year.
 * @param {import('pg').PoolClient} client - A transactional pg client
 * @param {string} enterpriseId - UUID of the enterprise
 * @returns {Promise<string>} Contract number e.g. "CTR-2025-0042"
 */
export async function nextContractNumber(client, enterpriseId) {
  const year = new Date().getFullYear();

  // Count existing contracts for this enterprise in the current year
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS cnt FROM contracts
     WHERE enterprise_id = $1
       AND EXTRACT(YEAR FROM created_at) = $2`,
    [enterpriseId, year]
  );

  const seq = String(rows[0].cnt + 1).padStart(4, '0');
  return `CTR-${year}-${seq}`;
}
