dev-init:
    terraform -chdir=infra/envs/dev init

dev-validate:
    terraform -chdir=infra/envs/dev validate

dev-plan:
    terraform -chdir=infra/envs/dev plan

dev-apply:
    terraform -chdir=infra/envs/dev apply
    ../k8s/setup.sh

dev-destroy:
    terraform -chdir=infra/envs/dev destroy
    ./nuke.sh
