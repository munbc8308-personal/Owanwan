import { createContext, useContext, useEffect, useState, useCallback } from "react";
import Purchases, { LOG_LEVEL, type CustomerInfo, type PurchasesPackage } from "react-native-purchases";
import { Platform } from "react-native";
import { useAuth } from "@/lib/auth";

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "";
const ENTITLEMENT = "premium";

interface PurchasesContextValue {
  isPremium: boolean;
  loading: boolean;
  packages: PurchasesPackage[];
  purchasePackage: (pkg: PurchasesPackage) => Promise<{ success: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextValue | null>(null);

function isPremiumFromInfo(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT] !== undefined;
}

export function PurchasesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);

  useEffect(() => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      setLoading(false);
      return;
    }
    Purchases.setLogLevel(LOG_LEVEL.ERROR);
    Purchases.setLogHandler((_level, message) => {
      console.log(`[RC] ${message}`);
    });
    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: IOS_KEY });
    }

    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
      setIsPremium(isPremiumFromInfo(info));
    });

    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (!user) return;
    Purchases.logIn(user.id).catch(() => {});
  }, [user]);

  const refresh = useCallback(async () => {
    try {
      const [info, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);
      setIsPremium(isPremiumFromInfo(info));
      const current = offerings.current;
      if (current) setPackages(current.availablePackages);
    } catch {
      // network error — keep last known state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const premium = isPremiumFromInfo(customerInfo);
      setIsPremium(premium);
      return { success: premium };
    } catch (e: any) {
      if (e.userCancelled) return { success: false };
      return { success: false, error: e.message ?? "결제 중 오류가 발생했어요" };
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    try {
      const info = await Purchases.restorePurchases();
      const premium = isPremiumFromInfo(info);
      setIsPremium(premium);
      return { success: premium };
    } catch (e: any) {
      return { success: false, error: e.message ?? "복원 중 오류가 발생했어요" };
    }
  }, []);

  return (
    <PurchasesContext.Provider value={{ isPremium, loading, packages, purchasePackage, restorePurchases, refresh }}>
      {children}
    </PurchasesContext.Provider>
  );
}

export function usePurchases() {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error("usePurchases must be inside PurchasesProvider");
  return ctx;
}
