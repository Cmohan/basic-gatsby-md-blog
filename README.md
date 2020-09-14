# Build a Basic Gatsby Blog with Markdown Posts

---

If you aren't familiar with it (I hadn't heard of it before 2020), [Gatsby](https://www.gatsbyjs.com/) is a static site generator that allows for the use of React components, plugins, and an internal GraphQL API to create sites that are interactive, run fast, and are quick to build.

NOTE: This tutorial requires NodeJS and npm. I'm using Powershell 7 as my command prompt but use whatever you feel comfortable with.

# Getting Started

If you haven't worked with Gatsby before, you'll need to install the Gatsby CLI first.

```bash
npm install -g gatsby-cli
```

Fastest way to get going, that I've found, is to use one of the project templates that Gatsby offers. You can find them all or submit your own at [gatsby.dev/starters](http://gatsby.dev/starters). However, the default Gatsby template that is used when you don't specify a particular template is actually quite complete and that can be a bit overwhelming if you haven't used Gatsby before. I'll be using their Hello World template for this tutorial since it creates less files and folders than the default template.

To make a new Gatsby site, navigate to the directory you want to store you project in and run the `new` command:

```bash
gatsby new gatsby-md-blog https://github.com/gatsbyjs/gatsby-starter-hello-world
```

The command goes `gatsby new <projectName> <projectTemplateURL>`. If you omit the template URL, it'll use the default Gatsby template.

It may take a bit to run so be patient. Once it's done you'll have a project folder containing a basic scaffolding of folders and files. Now would be a good time to run a `git init` to start the repository for this project, if you want to do that.

![Hello World Template File Structure](/screenshots/01.png)

Open `src/pages/index.js` and you'll see the code for basic page with a "Hello World" header. To view the page, run `gastby develop` from the root folder of the project to start up the development server.

![Powershell CLI - Successful Gatsby Development Server Start](/screenshots/02.png)

Once it's loaded, you'll see the localhost URL the development server is using. By default it's [http://localhost:8000/](http://localhost:8000/) but you can run the `develop` command with the `-p` flag to specify a particular port. 

![Hello World Home Page](/screenshots/03.png)

You'll also see another URL that ends with "graphql". This URL is a GraphQL API explorer where you can see all the accessible data in your site. We'll use this more later.

The development server auto-refreshes whenever you save changes to any of the pages so you don't need to stop and start it that often. For now, stop the development server with CTRL + C.

# Creating Posts

With our basic site created, we're going to setup the folder for our posts and create some sample posts. From the root folder of the project, create three post folders and the Markdown document for each post. Here is the Powershell code I used to do that.

```powershell
@("2020-09-01-first-post", "2020-09-05-second-post", "2020-09-10-third-post") | ForEach-Object {
    mkdir src/posts/2020/$_
}

cd src/posts/2020

Get-ChildItem -Directory | ForEach-Object {
    cd $_.FullName
    New-Item index.mdx
}
```

Here's what the resulting file structure should look like:

![Markdown Posts File Structure](/screenshots/04.png)

Open each index.mdx and put the following Markdown in the corresponding file:

### **First Post**

```markdown
---
title: First Post!
date: 2020-09-01
published: true
---

# h1 Heading

First MDX Post for Gatsby Blog! Hello World!

## h2 Heading

### h3 Heading
```

### **Second Post**

```markdown
---
title: Second Post!
date: 2020-09-05
published: true
---

This is my second post!

#### h4 Heading

##### h5 Heading

###### h6 Heading
```

### **Third Post**

```markdown
---
title: Third Post!
date: 2020-09-10
published: true
---

This is my third post!

> How my achievements mock me! -William Shakespeare
```

At the top of each post, between the dashes, is metatdata called `frontmatter` that we can access with the GraphQL API. Right now we just have the title, date, and a published value, but you can put other data in there that you need.

# Installing & Configuring Plugins

Now that we have posts, we need a way to display them!

We will be using two plugins to pull these posts and display them. 

- The [gatsby-source-filesystem](https://www.gatsbyjs.com/plugins/gatsby-source-filesystem/) plugin pulls the filesystem into the GraphQL API so you can access that information with calls to that API
- The [gatsby-plugin-mdx](https://www.gatsbyjs.com/plugins/gatsby-plugin-mdx/) plugin will allow Gatsby to read the MDX posts we just created and display them as pages.

To install the plugins and their dependencies, run the following command from the root folder of the project:

```bash
npm install gatsby-plugin-mdx @mdx-js/mdx @mdx-js/react gatsby-source-filesystem
```

Once the plugins are installed, we need to modify our `gatsby-config.js` file to configure them. Open the file and replace the `module.exports` section with the following code. This will tell Gatsby which file extensions the posts will be in and where they are in the file structure.

```jsx
module.exports = {
    siteMetadata: {
        title: `The Localhost Blog`,
        description: `This is my coding blog where I write about my coding journey.`,
    },
    plugins: [
        {
            resolve: `gatsby-plugin-mdx`,
            options: {
                extensions: [`.mdx`, `.md`],
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `posts`,
                path: `${__dirname}/src/posts`,
            },
        },
    ],
}
```

# Internal GraphQL API

The plugins we installed added information to the API that we can now pull with queries to the API. Remember that [http://localhost:8000/___graphql](http://localhost:8000/___graphql) URL we saw when we started up the development server? The development server provides an explorer tool to view the available information in the API and build queries.

Start up the development server with `gatsby develop` and go to that URL. You'll see a GraphQL API explorer for all the data available in your site.

![Internal GraphQL API Explorer](/screenshots/05.png)

Enter the following query in the editor to see all of the posts we created and the metadata we included in them.

```graphql
{
  allMdx {
    nodes {
      frontmatter {
        title
        date
      }
    }
  }
}
```

![GraphQL Query - All Markdown Posts](/screenshots/06.png)

There are other places you can put metadata. For metadata you want to use throughout your site, you can put that in the `gatsby-config.js` file. We included some when we updated that file earlier.

```jsx
module.exports = {
    siteMetadata: {
        title: `Gatsby Markdown Blog`,
        description: `Learn how to make a blog with Gatsby and Markdown posts.`,
    },
        ...
}
```

You can see that data in the GraphQL explorer too with this query

```graphql
{
  site {
    siteMetadata {
      title
      description
    }
  }
}
```

![GraphQL Explorer - Site Metadata](/screenshots/07.png)

Now that we have that info in the site, how do we use it in our pages? There are a few ways to use this data in Gatsby pages.

The first way we'll cover is to have a query within the page code that pulls the data. This is for mostly one-off queries that are only used on that one page.

The second way we'll cover is to have use a React Hook called `useStaticQuery` to pull the data into a file that can then be used multiple times throughout the site.

There is a third way that uses the `StaticQuery` tag to pull data into reusable page components. We won't be covering that method in this tutorial, but you can read more in the Gatsby documentation about it here: [https://www.gatsbyjs.com/docs/static-query/](https://www.gatsbyjs.com/docs/static-query/).

## Query In Page

Lets look at the first method, queries within the page file. Open `src/pages/index.js` and replace all the code with this and save the file.

```jsx
import * as React from 'react'
import { graphql } from 'gatsby'

export const query = graphql
`
    query HomePageQuery {
        site {
            siteMetadata {
                                title
                description
            }
        }
    }
`

const HomePage = ({ data }) => {
    return (
        <div>
                        <h1>{data.site.siteMetadata.title}</h1>
            <p>{data.site.siteMetadata.description}</p>
        </div>
    )
}

export default HomePage
```

In the import statements, we've added `import { graphql } from 'gatsby'` so we can access the GraphQL API within this code.

The next block is the GraphQL query that pulls the title and description metadata stored in `gatsby-config.js`.

After that we start defining the page. We now have `{data}` as a parameter of the HomePage to store the data pulled by the query. We can put that data in page by enclosing the variable in curly braces.

Now when we look at [http://localhost:8000](http://localhost:8000), we'll see this:

![Home Page using GraphQL Query within the Page](/screenshots/08.png)

## useStaticQuery Hook

Onto the second method, the `useStaticQuery` hook that can be reused throughout the site. We'll start by making two new files, `src/pages/about.js` & `src/hooks/use-site-metadata.js`.

![Folder structure with new About page and use-site-metadata file](/screenshots/09.png)

Open `use-site-metadata.js` and paste in the following code:

```jsx
import { graphql, useStaticQuery } from "gatsby"

export const useSiteMetadata = () => {
    const { site } = useStaticQuery( graphql
        `
            query SiteMetaData {
                site {
                    siteMetadata {
                        title
                        description
                    }
                }
            }
        `
    )

    return site.siteMetadata
}
```

This will be the hook that calls GraphQL and pulls the data we want. It looks similar to the block of code in our HomePage that called the API, but it wraps it up to be exported instead of automatically going to the page code block.

With the hook completed, we can use that data in our About page. Open the  `about.js`  we made previously and paste in the following code:

```jsx
import React from "react"
import { useSiteMetadata } from "../hooks/use-site-metadata"

const About = () => {
    const { title, description } = useSiteMetadata()
    return (
        <div>
            <h1>Welcome to {title}</h1>
            <p>About: {description}</p>
        </div>
    )
}

export default About
```

[http://localhost:8000/about](http://localhost:8000/about) now shows the site metadata we added.

![About page using useStaticQuery Hook GraphQL query](/screenshots/10.png)

Per the [Gatsby documentation](https://www.gatsbyjs.com/docs/use-static-query/) on this method, you can only use one `useStaticQuery` hook per page currently due to how Gatsby handles the queries, but each hook can be used multiple times throughout the site.

# Displaying Posts List

Using these methods to get data from our site and pages, we can programatically pull all the posts and display links to them in a list on our homepage.

Open `src/pages/index.js` and update the code to this:

```jsx
import * as React from 'react'
import { graphql } from 'gatsby'

export const query = graphql
`
    query SITE_INDEX_QUERY {
        site {
            siteMetadata {
                title
                description
            }
        }
        allMdx(
            sort: { fields: [frontmatter___date], order: DESC }
            filter: { frontmatter: { published: { eq: true } } }
        ) {
            nodes {
                id
                excerpt(pruneLength: 250)
                frontmatter {
                title
                date
                }
            }
        }
    }
`

const HomePage = ({ data }) => {
    return (
        <div>
            <div>
                <h1>{data.site.siteMetadata.title}</h1>
                <p>{data.site.siteMetadata.description}</p>
            </div>

            <div>
                {data.allMdx.nodes.map(({ excerpt, frontmatter }) => (
                    <>
                        <h1>{frontmatter.title}</h1>
                        <p>{frontmatter.date}</p>
                        <p>{excerpt}</p>
                    </>
                ))}
            </div>
        </div>
    )
}

export default HomePage
```

What have we changed?

We updated the query to also pull all of the Markdown posts we have, sort them based on the date metadata in each post, and filter out the posts that aren't "published" yet. If we don't sort them, they'll come back in no particular order. Besides the post metadata, we're also pulling the ID for each post and an excerpt that is limited to the first 250 characters.

We also updated the page's html code to display the list of posts. If you aren't familiar with the `map` function, it's a type of for-each loop that will execute the defined function for each node or post in our site. Each post will get a listing with the title of the post, the date, and a plain text excerpt of the post. 

[https://localhost:8000](https://localhost:8000) should look like this now.

![Homepage with list of posts](/screenshots/11.png)

# Creating Links to Posts

Gatsby has a handy tool called Node API that can help make the URLs for the post pages if we don't want to specify them in the metadata of the posts. These URLs are called slugs and once they're create, we can pull them with an API query to create links on the homepage. This tool will be run through a file called `gatsby-node.js`. It's not included in the Hello World template so you'll need to create it in the root folder of the project, like our `gatsby-config.js` file

![Folder Structure with new gatsby-node file](/screenshots/12.png)

Open the file and past in the following code:

```jsx
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
```

The `.onCreateNode()` function is called for each file or node in our Gatsby site. We have an If statement in the function to only act on the MDX files in our site. It uses the `createFilePath()` function from the `gatsby-souce-filesystem` plugin to create the URL and then we save it with the node.

Back on our homepage, `src/pages/index.js`, we can now update our GraphQL query to get that slug. It's located in the `nodes` section under `fields.slug`.

```jsx
export const query = graphql
`
    query SITE_INDEX_QUERY {
        site {
            siteMetadata {
              title
              description
            }
          }
          allMdx(sort: {fields: [frontmatter___date], order: DESC}, filter: {frontmatter: {published: {eq: true}}}) {
            nodes {
              id
              excerpt(pruneLength: 250)
              frontmatter {
                title
                date
              }
              fields {
                slug
              }
            }
          }
    }
`
```

You can see the slugs in if you put that query in the GraphQL explorer

![GraphQL Explorer - Get slug URLs](/screenshots/13.png)

To make links out of these slugs, we'll need to first update one of the import statements in `src/pages/index.js`.

```jsx
// Old Gatsby import statement
import { graphql } from 'gatsby'

//New Gatsby import statement
import { graphql, Link } from 'gatsby'
```

This allows us to use the `<Link>` object in our page HTML like this:

```jsx
const HomePage = ({ data }) => {
    return (
        <div>
            <div>
                <h1>{data.site.siteMetadata.title}</h1>
                <p>{data.site.siteMetadata.description}</p>
            </div>

            <div>
                {data.allMdx.nodes.map(({ excerpt, frontmatter, fields }) => (
                    <Link to={fields.slug}>
                        <h1>{frontmatter.title}</h1>
                        <p>{frontmatter.date}</p>
                        <p>{excerpt}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}
```

This will make the whole section a link:

![Homepage with list of Linked Posts - Section Link](/screenshots/14.png)

If you only wrap the title of the post in the `Link` then just the title will be linked:

```jsx
const HomePage = ({ data }) => {
    return (
        <div>
            <div>
                <h1>{data.site.siteMetadata.title}</h1>
                <p>{data.site.siteMetadata.description}</p>
            </div>

            <div>
                {data.allMdx.nodes.map(({ excerpt, frontmatter, fields }) => (
                    <div>
                    <Link to={fields.slug}>
                        <h1>{frontmatter.title}</h1>
                    </Link>
                        <p>{frontmatter.date}</p>
                        <p>{excerpt}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
```

![Homepage with List of Linked Posts - Title Link](/screenshots/15.png)

# Creating Post Pages

Great, you say, we have links but they don't actually go anywhere other than a 404 error page.  How do I make those pages out of the Markdown files? Again, the Node API can help us by making pages to go with those URLs using the `.createPages()` function.

Open your `gatsby-node.js` file and add this to the bottom, after the `.onCreateNode()` function.

```jsx
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
```

This query finds all of our Markdown posts and gets the slug URLs we created for them. Next, for each post found, we create a page at that URL using a template page, which we will make next. The context value lets us pass information to that new page that can be used on that page. In this case, we are passing the ID of the node. This will allow us take a template and populate it with the information from a specific post.

You can also pass through the slug and use that to pull posts from the API instead by setting the context to this:

```jsx
context: { slug: post.fields.slug, },
```

The last step to making these posts real pages it the template that will be filled with the post information. Create `src/components/post-page-template.js`, or whatever you set in the For-Each loop of the page creation function, and open it. Paste in this code:

```jsx
import { graphql } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import React from 'react'

export const query = graphql
    `
    query PostsByID($id: String!) {
        mdx(
            id: { eq: $id }
        ){
            body
            frontmatter {
                title
                date(formatString: "YYYY MMMM Do")
            }
        }
    }
`

export default ({ data }) => {
    const { frontmatter, body } = data.mdx
    return (
        <div>
            <h1>{frontmatter.title}</h1>
            <p>{frontmatter.date}</p>
            <MDXRenderer>{body}</MDXRenderer>
        </div>
    )
}
```

This query has something new in it: A Variable! The id we passed in the page creation can be used by the query to find a specific post as the variable `$id`. Our query pulls all the posts, finds one with the matching ID, and only pulls the information from that one. The new item we're pulling is `body` which is the contents of the post file.

Down in the HTML code for the page, we see the title and date information and then the body is wrapped in an `<MXRenderer>`  tag. This tag will interpret the Markdown text in the body and convert it to HTML so it can be displayed on the page.

If you passed through the slug rather than the ID, modify your query to this instead:

```jsx
export const query = graphql
    `
    query PostsByID($id: String!) {
        mdx(
            fields: { slug: { eq: $slug } }
        ){
            body
            frontmatter {
                title
                date(formatString: "YYYY MMMM Do")
            }
        }
    }
`
```

Save this file and then restart the development server. You should now be able to click the post titles and see your posts at the proper URLs!

![Post Page - First Post](/screenshots/16.png)

![Post Page - Second Post](/screenshots/17.png)

![Post Page - Third Post](/screenshots/18.png)

**Congratulations! You made a blog using Gatsby and Markdown posts!**

# Next Steps

## Styling

Your blog works, but it's pretty plain-looking. Fortunately, that is fixable. Gatsby allows for CSS to be used in a page's file or in a separate file that is imported. You can find more information about that here: [https://www.gatsbyjs.com/docs/styling/](https://www.gatsbyjs.com/docs/styling/)

Another styling tool to look into is components. Similar to what we did with the template page for our posts, you can setup reusable blocks that can be imported into pages across your site, such as a header or a footer. Here is Gatsby's documentation on layout components: [https://www.gatsbyjs.com/docs/layout-components/](https://www.gatsbyjs.com/docs/layout-components/)

## Hosting

Once your blog is spiffed up a bit, you might want to show it off. Gatsby has documentation on deploying your site to many different hosting options such as AWS, Azure, Heroku, and GitHub pages. You can find those articles here: [https://www.gatsbyjs.com/docs/deploying-and-hosting/](https://www.gatsbyjs.com/docs/deploying-and-hosting/)

Gatsby also offers their own hosting option called [Gatsby Cloud](https://www.gatsbyjs.com/cloud/), specifically for Gatsby sites. They offer integrations with other services for automatic deployment of your site, as well as specialized servers that are built specifically Gatsby sites and provide quicker builds. Here is the documentation on Gatsby Cloud: [https://www.gatsbyjs.com/docs/deploying-to-gatsby-cloud/](https://www.gatsbyjs.com/docs/deploying-to-gatsby-cloud/).

## Add Features

Some ideas are adding Prev/Next navigation to the posts, displaying code blocks with synax highlighting, giving your posts cover photos, or creating an SEO component to attach to all your pages.