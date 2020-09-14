const { createFilePath } = require(`gatsby-source-filesystem`);

exports.onCreateNode = ({ node, actions, getNode }) => {
    const { createNodeField } = actions

    if (node.internal.type === `Mdx`) {
        const value = createFilePath({ node, getNode })

        createNodeField({
            name: `slug`,
            node,
            value: `/posts${value}`,
        })
    }
}

const path = require("path")

exports.createPages = async ({ graphql, actions, reporter }) => {
    const { createPage } = actions

    const result = await graphql
    (`
        query {
            allMdx {
                edges {
                    node {
                        id
                        fields {
                        slug
                        }
                    }
                }
            }
        }
    `)

    if (result.errors) {
        reporter.panicOnBuild('🚨  ERROR: Loading "createPages" query')
    }

    // Create blog post pages.
    const posts = result.data.allMdx.edges

    posts.forEach(({ node }, index) => {
        createPage({
            path: node.fields.slug,
            component: path.resolve(`./src/components/post-page-template.js`),
            context: { id: node.id },
        })
    })
}

