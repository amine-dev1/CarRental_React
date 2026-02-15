// Feature flags configuration
export const FEATURES = {
  analytics: {
    Free: false,
    Pro: true,
    Enterprise: true
  },
  calendar: {
    Free: false,
    Pro: true,
    Enterprise: true
  },
  exports: {
    Free: false,
    Pro: true,
    Enterprise: true
  },
  automations: {
    Free: false,
    Pro: true,
    Enterprise: true
  },
  clientPortal: {
    Free: false,
    Pro: true,
    Enterprise: true
  },
  multiSite: {
    Free: false,
    Pro: false,
    Enterprise: true
  },
  aiPredictions: {
    Free: false,
    Pro: false,
    Enterprise: true
  },
  apiAccess: {
    Free: false,
    Pro: false,
    Enterprise: true
  },
  whiteLabeling: {
    Free: false,
    Pro: false,
    Enterprise: true
  }
};

/**
 * Check if a plan has access to a specific feature
 * @param {string} plan - 'Free', 'Pro', or 'Enterprise'
 * @param {string} feature - Feature name from FEATURES object
 * @returns {boolean}
 */
export function hasFeature(plan, feature) {
  return FEATURES[feature]?.[plan] || false;
}

/**
 * Get plan limits
 * @param {string} plan - 'Free', 'Pro', or 'Enterprise'
 * @returns {object} - { maxVehicles, maxUsers }
 */
export function getPlanLimits(plan) {
  const limits = {
    Free: { maxVehicles: 5, maxUsers: 2 },
    Pro: { maxVehicles: 50, maxUsers: 10 },
    Enterprise: { maxVehicles: 999999, maxUsers: 999999 }
  };
  
  return limits[plan] || limits.Free;
}
