export function getNativeSymbol(chainId: number): string {
  switch (chainId) {
    case 1:
    case 11155111:
      return "ETH";
    case 137:
    case 80001:
      return "POL";
    default:
      return "UNKNOWN";
  }
}
