# Number Input with Suffixes

FirePulse now supports entering numbers with convenient suffixes, making it easier to input large values without typing many zeros.

## Supported Formats

### Western Number System (USD, EUR, GBP, etc.)
- **K** (Thousand): `10k` = 10,000
- **M** (Million): `1m` = 1,000,000

### Indian Number System (INR)
- **K** (Thousand): `10k` = 10,000
- **L** or **Lac/Lakh** (Lakh): `5lac` = 5,00,000
- **Cr** or **Crore**: `5cr` = 5,00,00,000

## Examples

### Entering Values
Instead of typing:
- `10000000` → Type `10m` or `1cr` (for INR)
- `500000` → Type `500k` or `5lac` (for INR)
- `50000` → Type `50k`

### Decimal Support
You can also use decimals:
- `1.5m` = 1,500,000
- `2.5lac` = 2,50,000
- `10.5k` = 10,500

### Case Insensitive
All suffixes work regardless of case:
- `10K`, `10k` → Both work
- `1M`, `1m` → Both work
- `5Cr`, `5cr`, `5CR` → All work

## How It Works

1. **Click on any number input field** in the wizard
2. **Type your number with a suffix** (e.g., `10k`, `1m`, `5lac`)
3. **Press Enter or click outside** the field
4. The value will be automatically converted to the full number

## Display Format

When you're not editing a field, the app will automatically display numbers in a compact format based on your selected currency:
- **USD/EUR/GBP**: Shows as K or M (e.g., 10K, 1.5M)
- **INR**: Shows as K, L, or Cr (e.g., 10K, 5L, 1.5Cr)

This makes it easier to read and understand large numbers at a glance!
