import crypto from "crypto"

export class DatasetFingerprintingService {
  /**
   * Generate SHA-256 hash for exact content matching
   */
  static generateContentHash(content: Buffer | string): string {
    return crypto.createHash("sha256").update(content).digest("hex")
  }

  /**
   * Generate schema fingerprint based on column structure
   */
  static generateSchemaHash(schema: Record<string, string>): string {
    const schemaString = Object.entries(schema)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, type]) => `${key}:${type}`)
      .join("|")

    return crypto.createHash("sha256").update(schemaString).digest("hex")
  }

  /**
   * Generate statistical fingerprint for approximate matching
   */
  static generateStatisticalHash(data: any[]): string {
    if (!data.length) return ""

    const stats = this.calculateStatistics(data)
    const statsString = JSON.stringify(stats)

    return crypto.createHash("sha256").update(statsString).digest("hex")
  }

  /**
   * Calculate basic statistics for numerical columns
   */
  private static calculateStatistics(data: any[]): Record<string, any> {
    const stats: Record<string, any> = {}

    if (!data.length) return stats

    const columns = Object.keys(data[0])

    columns.forEach((column) => {
      const values = data.map((row) => row[column]).filter((v) => v != null)

      if (values.length === 0) return

      const numericValues = values.filter((v) => typeof v === "number")

      if (numericValues.length > 0) {
        stats[column] = {
          type: "numeric",
          mean: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          count: numericValues.length,
        }
      } else {
        const uniqueValues = new Set(values)
        stats[column] = {
          type: "categorical",
          uniqueCount: uniqueValues.size,
          mostCommon: this.getMostCommon(values),
          count: values.length,
        }
      }
    })

    return stats
  }

  /**
   * Get most common value in array
   */
  private static getMostCommon(arr: any[]): any {
    const counts: Record<string, number> = {}
    arr.forEach((item) => {
      const key = String(item)
      counts[key] = (counts[key] || 0) + 1
    })

    return Object.entries(counts).reduce((a, b) => (counts[a[0]] > counts[b[0]] ? a : b))[0]
  }

  /**
   * Generate Merkle tree root for hierarchical verification
   */
  static generateMerkleRoot(chunks: string[]): string {
    if (chunks.length === 0) return ""
    if (chunks.length === 1) return chunks[0]

    const nextLevel: string[] = []

    for (let i = 0; i < chunks.length; i += 2) {
      const left = chunks[i]
      const right = chunks[i + 1] || left
      const combined = crypto
        .createHash("sha256")
        .update(left + right)
        .digest("hex")
      nextLevel.push(combined)
    }

    return this.generateMerkleRoot(nextLevel)
  }

  /**
   * Create Bloom filter for probabilistic duplicate detection
   */
  static createBloomFilter(items: string[], size = 1000, hashCount = 3): string {
    const bitArray = new Array(size).fill(0)

    items.forEach((item) => {
      for (let i = 0; i < hashCount; i++) {
        const hash = crypto
          .createHash("sha256")
          .update(item + i)
          .digest("hex")
        const index = Number.parseInt(hash.substring(0, 8), 16) % size
        bitArray[index] = 1
      }
    })

    return bitArray.join("")
  }
}
