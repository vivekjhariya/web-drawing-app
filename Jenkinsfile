pipeline {
    agent {label "dev"}
    
    stages {
        stage("clone Repository") {
            steps {
                git url: "https://github.com/vivekjhariya/web-drawing-app.git", branch: "main"
            }
        }
        stage("verify docker & compose") {
            steps {
                sh '''
                    set -e 
                    if docker --version 2>/dev/null | grep -q "Docker"; then
                        echo "docker is already installed"
                    else 
                        echo "docker not found. installing.."
                        sudo apt-get update -y
                        curl -fsSL https://get.docker.com | sudo sh
                        sudo systemctl enable docker 
                        sudo systemctl start docker
                        sudo usermod -aG docker jenkins
                        sudo usermod -aG docker $USER
                        sudo systemctl restart jenkins
                        sudo -u jenkins docker --version
                        sudo systemctl status jenkins
                        sudo reboot
                    fi
                    
                    if docker compose version >/dev/null 2>&1; then
                        echo "docker-compose is already installed"
                    else
                        echo "docker compose-v2 not found. installing..."
                        sudo mkdir -p /usr/local/lib/docker/cli-plugins
                        sudo curl -SL https://github.com/docker/compose/releases/download/v2.25.0/docker-compose-linux-x86_64 \
                            -o /usr/local/lib/docker/cli-plugins/docker-compose
                        sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
                    fi
                '''
            }
        }
        stage("verify java & dependencies"){
            steps{
                sh ''' 
                set -e
                 if java -version 2>/dev/null | grep -q "openjdk"; then
                     echo "java is already installed"
                 else 
                    echo "java not found installing..."
                    sudo apt update -y
                    sudo apt install -y fontconfig openjdk-21-jre
                    java -version
                    sudo reboot
                 fi   
                 
             '''
            }
        }
        stage("3.docker build via dockerHub") {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "dockerHubCreds",
                    usernameVariable: "dockerHubuser",
                    passwordVariable: "dockerHubpass")]) {
                    sh "sudo usermod -aG docker $USER"
                    sh "newgrp docker"
                    sh "docker build -t my-drawing-app:latest ."
                    sh "docker image tag my-drawing-app:latest ${dockerHubuser}/my-drawing-app:latest"
                }
            }
        }
        stage("4.login and push to dockerHub") {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "dockerHubCreds",
                    usernameVariable: "dockerHubuser",
                    passwordVariable: "dockerHubpass")]) {
                    sh "docker login -u ${dockerHubuser} -p ${dockerHubpass}"
                    sh "docker push ${dockerHubuser}/my-drawing-app:latest"
                }
            }
        }
        stage("5.run docker-compose") {
            steps {
                sh "docker compose up --build -d"
            }
        }
    }

    post{

        success{
            script{
                emailext from: 'vivekjhariya242@gmail.com'
                to: 'vivekjhariya241@gmail.com'
                body: 'your project drawing-app was successfully build'
                subject: 'build successful !'
                
            }
        }
        failure{
            script{
                emailext from: 'vivekjhariya242@gmail.com'
                to: 'vivekjhariya241@gmail.com'
                body: 'your project drawing-app buil was failed'
                subject: 'build fail !'
                
            }
        }

        
    }
}
