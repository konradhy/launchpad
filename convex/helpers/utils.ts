import { DataModel, Doc, Id } from "../_generated/dataModel";
import {
  GenericQueryCtx,
  UserIdentity,
  GenericMutationCtx,
} from "convex/server";
import { ConvexError, GenericId, v } from "convex/values";

enum ErrorMessage {
  Files = "You must be logged in to access files.",
  Notes = "You must be logged in to access notes.",
  CompanyInformation = "You must be logged in to access company information.",
}

export async function validateUserAndCompany(
  ctx: GenericQueryCtx<DataModel>,
  errorContext: keyof typeof ErrorMessage,
): Promise<{
  user: Doc<"users">;
  company: Doc<"companies">;
  identity: UserIdentity;
}> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError({
      message: ErrorMessage[errorContext],
      severity: "low",
    });
  }

  const userId = identity.tokenIdentifier;
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", userId))
    .unique();

  if (!user) {
    throw new Error("Unauthenticated call to mutation");
  }
  if (!user.companyId) {
    throw new ConvexError({
      message: "You must be associated with a company to perform this action",
      severity: "low",
    });
  }

  const company = await ctx.db.get(user.companyId);
  if (!company) {
    throw new ConvexError({
      message: "We couldn't find the company you are looking for.",
      severity: "low",
    });
  }

  if (company.userId !== userId && !company.associatedUsers?.includes(userId)) {
    throw new ConvexError({
      message: "You do not have permission to perform this action.",
      severity: "low",
    });
  }

  return { user, company, identity };
}

export async function validateUserAndCompanyMutations(
  ctx: GenericMutationCtx<DataModel>,
  errorContext: keyof typeof ErrorMessage,
): Promise<{
  user: Doc<"users">;
  company: Doc<"companies">;
  identity: UserIdentity;
}> {
  const identity = await ctx.auth.getUserIdentity();
  console.log("identity", identity);

  if (!identity) {
    throw new ConvexError({
      message: ErrorMessage[errorContext],
      severity: "low",
    });
  }

  const userId = identity.tokenIdentifier;
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", userId))
    .unique();

  if (!user) {
    throw new Error("Unauthenticated call to mutation");
  }
  if (!user.companyId) {
    throw new ConvexError({
      message: "You must be associated with a company to perform this action",
      severity: "low",
    });
  }

  const company = await ctx.db.get(user.companyId);
  if (!company) {
    throw new ConvexError({
      message: "We couldn't find the company you are looking for.",
      severity: "low",
    });
  }

  if (company.userId !== userId && !company.associatedUsers?.includes(userId)) {
    throw new ConvexError({
      message: "You do not have permission to perform this action.",
      severity: "low",
    });
  }

  return { user, company, identity };
}
