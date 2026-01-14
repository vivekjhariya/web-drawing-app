@Library('sharelib') _
pipeline{

agent {label "dev"};


    environment {
        NOTIFY_EMAIL = "shivaya2421@gmail.com"
    }


stages{


    stage("repoClone"){

        steps{

            script{
                gitCheckout("https://github.com/vivekjhariya/web-drawing-app.git", "main")
            }


        }
    }



     stage("dockerInstallation"){

        steps{

            script{

                dockerInstall()
            }


        }
    }

     stage("jenkinsPluginsInstallation"){

        steps{

            script{

                jenkinsPlugins()
            }


        }
    }

     stage("dockerBuildAndPush"){

        steps{

            script{
                dockerBuildAndPush("dockerHubCreds", "web-drawing-app")
            }


        }
    }

     stage("cleanupOldDockerImages"){

        steps{

            script{
                dockerCleanup("web-drawing-app", 2)
            }


        }
    }

     stage("dockerDeploy"){

        steps{

            script{
                dockerDeploy()
            }


        }
    }


}

  post {
        success {
            emailNotify("SUCCESS", env.NOTIFY_EMAIL)
        }
        failure {
            emailNotify("FAILED", env.NOTIFY_EMAIL)
        }
    }




}
