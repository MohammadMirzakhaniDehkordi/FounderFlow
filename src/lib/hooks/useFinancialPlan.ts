"use client";

import { useState, useCallback } from "react";
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, query, where, orderBy, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useWizardStore } from "@/lib/store/wizardStore";
import { useAuthContext } from "@/components/providers/AuthProvider";
import type { OperatingCostItem } from "@/lib/types";

export interface SavedPlan {
  id: string;
  userId: string;
  planName: string;
  companyName: string;
  createdAt: Date;
  updatedAt: Date;
  data: {
    company: Record<string, unknown>;
    plan: Record<string, unknown>;
    revenue: Record<string, unknown>;
    personnel: Record<string, unknown>;
    operatingCosts: {
      items: OperatingCostItem[];
    };
    investments: Record<string, unknown>;
    loans: Record<string, unknown>;
  };
}

export function useFinancialPlan() {
  const { user } = useAuthContext();
  const wizardStore = useWizardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Save current wizard data to Firestore
   */
  const savePlan = useCallback(async (planId?: string): Promise<string> => {
    if (!user) {
      throw new Error("User must be logged in to save a plan");
    }

    setLoading(true);
    setError(null);

    try {
      const id = planId || crypto.randomUUID();
      const planRef = doc(db, "plans", id);

      const planData = {
        userId: user.uid,
        planName: wizardStore.plan.name || "Unnamed Plan",
        companyName: wizardStore.company.companyName || "My UG",
        updatedAt: serverTimestamp(),
        data: {
          company: wizardStore.company,
          plan: wizardStore.plan,
          revenue: wizardStore.revenue,
          personnel: wizardStore.personnel,
          operatingCosts: wizardStore.operatingCosts,
          investments: wizardStore.investments,
          loans: wizardStore.loans,
        },
      };

      // If new plan, add createdAt
      if (!planId) {
        await setDoc(planRef, {
          ...planData,
          createdAt: serverTimestamp(),
        });
      } else {
        await setDoc(planRef, planData, { merge: true });
      }

      // Update store with plan ID
      wizardStore.setPlanId(id);

      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save plan";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, wizardStore]);

  /**
   * Load a plan from Firestore into the wizard store
   */
  const loadPlan = useCallback(async (planId: string): Promise<void> => {
    if (!user) {
      throw new Error("User must be logged in to load a plan");
    }

    setLoading(true);
    setError(null);

    try {
      const planRef = doc(db, "plans", planId);
      const planSnap = await getDoc(planRef);

      if (!planSnap.exists()) {
        throw new Error("Plan not found");
      }

      const planData = planSnap.data();

      // Verify ownership
      if (planData.userId !== user.uid) {
        throw new Error("Access denied");
      }

      // Load data into wizard store
      wizardStore.loadAllData({
        planId,
        company: planData.data.company,
        plan: planData.data.plan,
        revenue: planData.data.revenue,
        personnel: planData.data.personnel,
        operatingCosts: planData.data.operatingCosts,
        investments: planData.data.investments,
        loans: planData.data.loans,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load plan";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, wizardStore]);

  /**
   * Get all plans for the current user
   */
  const getUserPlans = useCallback(async (): Promise<SavedPlan[]> => {
    if (!user) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const plansRef = collection(db, "plans");
      const q = query(
        plansRef,
        where("userId", "==", user.uid),
        orderBy("updatedAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const plans: SavedPlan[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        plans.push({
          id: doc.id,
          userId: data.userId,
          planName: data.planName,
          companyName: data.companyName,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          data: data.data,
        });
      });

      return plans;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch plans";
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Delete a plan
   */
  const deletePlan = useCallback(async (planId: string): Promise<void> => {
    if (!user) {
      throw new Error("User must be logged in to delete a plan");
    }

    setLoading(true);
    setError(null);

    try {
      const planRef = doc(db, "plans", planId);
      const planSnap = await getDoc(planRef);

      if (!planSnap.exists()) {
        throw new Error("Plan not found");
      }

      // Verify ownership
      if (planSnap.data().userId !== user.uid) {
        throw new Error("Access denied");
      }

      await deleteDoc(planRef);

      // If this was the current plan, reset the store
      if (wizardStore.planId === planId) {
        wizardStore.reset();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete plan";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, wizardStore]);

  return {
    savePlan,
    loadPlan,
    getUserPlans,
    deletePlan,
    loading,
    error,
  };
}
