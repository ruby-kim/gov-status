module.exports = {
  siteUrl: 'https://gov-status.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  robotsTxtOptions: {
    transformRobotsTxt: async (config, robotsTxt) => {
      return `${robotsTxt}
#DaumWebMasterTool:be7566ba7bb9edae1ab1bdc66d11a4a660bd2432ded676c33c1ddb4cc77a4341:gYDr/iJJHsctuB/dlMw7Yg==`
    },
  },
}
