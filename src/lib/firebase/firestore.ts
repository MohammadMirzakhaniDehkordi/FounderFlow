import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type {
  Company,
  Plan,
  RevenueData,
  PersonnelData,
  OperatingCostsData,
  InvestmentsData,
  LoansData,
  CalculatedData,
} from "../types";

// Companies
export async function createCompany(
  userId: string,
  companyData: Omit<Company, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "companies"), {
    ...companyData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getCompany(companyId: string): Promise<Company | null> {
  const docSnap = await getDoc(doc(db, "companies", companyId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Company;
  }
  return null;
}

export async function getUserCompanies(userId: string): Promise<Company[]> {
  const q = query(
    collection(db, "companies"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Company[];
}

export async function updateCompany(
  companyId: string,
  data: Partial<Omit<Company, "id" | "userId" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "companies", companyId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCompany(companyId: string): Promise<void> {
  await deleteDoc(doc(db, "companies", companyId));
}

// Plans
export async function createPlan(
  companyId: string,
  planData: Omit<Plan, "id" | "companyId" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "companies", companyId, "plans"), {
    ...planData,
    companyId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getPlan(companyId: string, planId: string): Promise<Plan | null> {
  const docSnap = await getDoc(doc(db, "companies", companyId, "plans", planId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Plan;
  }
  return null;
}

export async function getCompanyPlans(companyId: string): Promise<Plan[]> {
  const q = query(
    collection(db, "companies", companyId, "plans"),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Plan[];
}

export async function updatePlan(
  companyId: string,
  planId: string,
  data: Partial<Omit<Plan, "id" | "companyId" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "companies", companyId, "plans", planId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePlan(companyId: string, planId: string): Promise<void> {
  await deleteDoc(doc(db, "companies", companyId, "plans", planId));
}

// Plan Sub-collections (Revenue, Personnel, etc.)
type PlanSubcollection = "revenue" | "personnel" | "operatingCosts" | "investments" | "loans" | "calculated";

async function setPlanData<T extends object>(
  companyId: string,
  planId: string,
  subcollection: PlanSubcollection,
  data: T
): Promise<void> {
  const docRef = doc(db, "companies", companyId, "plans", planId, subcollection, "data");
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }).catch(async () => {
    // If document doesn't exist, create it
    const { setDoc } = await import("firebase/firestore");
    await setDoc(docRef, {
      ...data,
      planId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

async function getPlanData<T>(
  companyId: string,
  planId: string,
  subcollection: PlanSubcollection
): Promise<T | null> {
  const docSnap = await getDoc(
    doc(db, "companies", companyId, "plans", planId, subcollection, "data")
  );
  if (docSnap.exists()) {
    return docSnap.data() as T;
  }
  return null;
}

// Revenue
export async function setRevenueData(
  companyId: string,
  planId: string,
  data: Omit<RevenueData, "planId">
): Promise<void> {
  await setPlanData(companyId, planId, "revenue", data);
}

export async function getRevenueData(
  companyId: string,
  planId: string
): Promise<RevenueData | null> {
  return getPlanData<RevenueData>(companyId, planId, "revenue");
}

// Personnel
export async function setPersonnelData(
  companyId: string,
  planId: string,
  data: Omit<PersonnelData, "planId">
): Promise<void> {
  await setPlanData(companyId, planId, "personnel", data);
}

export async function getPersonnelData(
  companyId: string,
  planId: string
): Promise<PersonnelData | null> {
  return getPlanData<PersonnelData>(companyId, planId, "personnel");
}

// Operating Costs
export async function setOperatingCostsData(
  companyId: string,
  planId: string,
  data: Omit<OperatingCostsData, "planId">
): Promise<void> {
  await setPlanData(companyId, planId, "operatingCosts", data);
}

export async function getOperatingCostsData(
  companyId: string,
  planId: string
): Promise<OperatingCostsData | null> {
  return getPlanData<OperatingCostsData>(companyId, planId, "operatingCosts");
}

// Investments
export async function setInvestmentsData(
  companyId: string,
  planId: string,
  data: Omit<InvestmentsData, "planId">
): Promise<void> {
  await setPlanData(companyId, planId, "investments", data);
}

export async function getInvestmentsData(
  companyId: string,
  planId: string
): Promise<InvestmentsData | null> {
  return getPlanData<InvestmentsData>(companyId, planId, "investments");
}

// Loans
export async function setLoansData(
  companyId: string,
  planId: string,
  data: Omit<LoansData, "planId">
): Promise<void> {
  await setPlanData(companyId, planId, "loans", data);
}

export async function getLoansData(
  companyId: string,
  planId: string
): Promise<LoansData | null> {
  return getPlanData<LoansData>(companyId, planId, "loans");
}

// Calculated Data
export async function setCalculatedData(
  companyId: string,
  planId: string,
  data: Omit<CalculatedData, "planId" | "calculatedAt">
): Promise<void> {
  const docRef = doc(db, "companies", companyId, "plans", planId, "calculated", "data");
  const { setDoc } = await import("firebase/firestore");
  await setDoc(docRef, {
    ...data,
    planId,
    calculatedAt: serverTimestamp(),
  });
}

export async function getCalculatedData(
  companyId: string,
  planId: string
): Promise<CalculatedData | null> {
  return getPlanData<CalculatedData>(companyId, planId, "calculated");
}

// Get all plan data at once
export async function getAllPlanData(companyId: string, planId: string) {
  const [revenue, personnel, operatingCosts, investments, loans, calculated] =
    await Promise.all([
      getRevenueData(companyId, planId),
      getPersonnelData(companyId, planId),
      getOperatingCostsData(companyId, planId),
      getInvestmentsData(companyId, planId),
      getLoansData(companyId, planId),
      getCalculatedData(companyId, planId),
    ]);

  return {
    revenue,
    personnel,
    operatingCosts,
    investments,
    loans,
    calculated,
  };
}
