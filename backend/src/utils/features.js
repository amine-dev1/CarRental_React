// Feature flags configuration
export const FEATURES = {
  analytics: {
    Standard: false,
    Pro: true,
    Enterprise: true
  },
  calendar: {
    Standard: false,
    Pro: true,
    Enterprise: true
  },
  exports: {
    Standard: false,
    Pro: true,
    Enterprise: true
  },
  automations: {
    Standard: false,
    Pro: true,
    Enterprise: true
  },
  clientPortal: {
    Standard: false,
    Pro: true,
    Enterprise: true
  },
  multiSite: {
    Standard: false,
    Pro: false,
    Enterprise: true
  },
  aiPredictions: {
    Standard: false,
    Pro: false,
    Enterprise: true
  },
  apiAccess: {
    Standard: false,
    Pro: false,
    Enterprise: true
  },
  whiteLabeling: {
    Standard: false,
    Pro: false,
    Enterprise: true
  }
};

/**
 * Check if a plan has access to a specific feature
 * @param {string} plan - 'Standard', 'Pro', or 'Enterprise'
 * @param {string} feature - Feature name from FEATURES object
 * @returns {boolean}
 */
export function hasFeature(plan, feature) {
  return FEATURES[feature]?.[plan] || false;
}

/**
 * Get plan limits
 * @param {string} plan - 'Standard', 'Pro', or 'Enterprise'
 * @returns {object} - { maxVehicles, maxUsers }
 */
export function getPlanLimits(plan) {
  const limits = {
    Standard: { maxVehicles: 5, maxUsers: 2 },
    Pro: { maxVehicles: 50, maxUsers: 10 },
    Enterprise: { maxVehicles: 999999, maxUsers: 999999 }
  };

  return limits[plan] || limits.Standard;
}
